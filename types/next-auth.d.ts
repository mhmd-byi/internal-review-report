import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface User {
        role?: string;
        id?: string;
        itsId?: string;
        responsibility?: string;
    }

    interface Session {
        user: {
            id?: string;
            name?: string | null;
            email?: string | null;
            itsId?: string;
            role?: string;
            responsibility?: string;
        } & DefaultSession["user"];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role?: string;
        itsId?: string;
        responsibility?: string;
    }
}
