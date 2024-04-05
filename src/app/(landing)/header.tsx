import Image from "next/image";
import {Button} from "@/components/ui/button";
import Link from "next/link";
export const Header = () => {
    return (
        <header className="h-20 w-full border-b-2 border-slate-200 px4">
            <div className="lg:max-w-screen-lg mx-auto flex items-center justify-between h-full">
                <div className="pt-8 pl-4 pb-7 flex items-center gap-x-3">
                    <Image src="/logo.svg" height={40} width={40} alt="Webinarium"/>
                    <h1 className="text-2xl font-black">
                        <a href="/">Webinarium</a>
                    </h1>
                </div>


                <div className="pt-8 pr-4 pb-7 flex items-center gap-x-3">
                    <Link href="/auth/login"><Button variant="ghost" children='Вход'/></Link>
                    <Link href="/auth/register"><Button variant="outline" children='Регистрация'/></Link>
                </div>
            </div>
        </header>
    );
};

