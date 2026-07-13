export class IsoDateHelper {

    public static today() : string {
        const date = new Date();
        return date.toISOString();
    }

    public static yesterday() : string {
        const date = new Date();
        date.setDate(date.getDate() - 1);
        return date.toISOString();
    }

    public static tomorrow() : string {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        return date.toISOString();
    }
}
