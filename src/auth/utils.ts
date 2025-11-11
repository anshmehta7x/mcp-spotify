import axios from "axios";

export const generateRandomString = function (length: number) {
    let text = "";
    const possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

type ShortenURLMethod = (urlToShorten: string) => Promise<string>;

export const shortenURL: ShortenURLMethod = async function (urlToShorten: string) {
    try {
        const response = await axios.get(
            "https://is.gd/create.php",
            {
                params: {
                    format: "simple",
                    url: urlToShorten
                }
            }
        );

        return response.data;
    } catch (error) {
        console.error("Error shortening URL:", error);
        return "ERROR";
    }
}
