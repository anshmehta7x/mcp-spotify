import { z } from "zod";
import { AuthService } from "../auth/authservice.js";

const auth = AuthService.getInstance();

export { z };

export interface ToolConfig<T> {
    name: string;
    desc: string;
    in: z.ZodType<T>;
    out?: z.ZodType<any>;
}

export function createTool<T>(cfg: ToolConfig<T>, h: (s: string, i: T) => Promise<any>) {
    return {
        name: cfg.name,
        config: {
            title: cfg.name.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" "),
            desc: cfg.desc,
            in: cfg.in,
            out: cfg.out ?? z.any(),
        },
        handler: async (s: string, i: T) => ({
            content: [{ type: "text", text: JSON.stringify(await h(s, i)) }],
            structuredContent: await h(s, i),
        }),
    };
}

export function mkRead<T>(n: string, d: string, s: z.ZodType<T>, f: (s: string, i: T) => Promise<any>) {
    return createTool({ name: n, desc: d, in: s }, async (sess, i) => f(sess, i));
}

export function mkAction<T, R = void>(n: string, d: string, s: z.ZodType<T>, f: (s: string, i: T) => Promise<R>) {
    return createTool(
        { name: n, desc: d, in: s, out: z.object({ success: z.literal(true) }) },
        async (sess, i) => { await f(sess, i); return { success: true }; }
    );
}

export const empty = z.object({});
export const mkt = z.object({ market: z.string().optional() });
export const ids = z.object({ ids: z.string().min(1) });
export const pag = (max = 50) => z.object({
    limit: z.number().min(1).max(max).optional().default(20),
    offset: z.number().min(0).optional().default(0),
});

export async function sessionInfo(s: string) {
    return { isAuth: auth.isAuthenticated(s) };
}
