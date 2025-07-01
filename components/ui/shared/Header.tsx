

import { Heading } from "@chakra-ui/react";
import Link from "next/link";
import MenuButton from "./Menu";
import { auth } from "@/auth";


const Header = async () => {
  const session = await auth();
  return (
    <header className="w-full border-b">
        <div className="wrapper flex-between bg-slate-800">
        <div className="flex-start">
          <Link href="/" className="flex-start ml-4">
            <Heading className="text-3xl font-bold text-gray-800">
              Tennis DB
            </Heading>
          </Link>
        </div>
        {session?.user?.name &&  <MenuButton name={session?.user?.name}/>}
      </div>
    </header>
  );
};

export default Header;
