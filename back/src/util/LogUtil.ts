export function error(message: string, err: Error) {
    console.error("");
    console.error(message);

    if(err !== undefined) {
        console.error("----------------------------------------------------------");
        console.error(err.stack);
        console.error("----------------------------------------------------------");
        console.error("");
    }
}