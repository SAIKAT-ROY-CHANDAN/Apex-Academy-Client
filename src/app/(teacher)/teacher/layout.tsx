import logo from "@/assets/institution/logo.svg";
import Image from "next/image";
import TeacherProfileDropdown from "../_components/TeacherProfileDropdown";
import { loggedInTeacherUser } from "@/services/logged-user";
import { Menu } from "lucide-react";

const TeacherLayout = async ({ children }: { children: React.ReactNode }) => {
  const loggedInTeacher = await loggedInTeacherUser();
  
  return (
    <div className="border-b border-border/50 bg-background">
      <nav className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left side - Logo and Brand */}
        <div className="flex items-center space-x-4">
          <Image src={logo} alt="Institution Logo" width={32} height={32} />
          <div className="space-y-0">
            <h1 className="text-lg font-semibold text-foreground">
              Educational Institute Management
            </h1>
            <p className="text-xs text-muted-foreground">
              Teacher Portal
            </p>
          </div>
        </div>
        
        {/* Right side - Profile Dropdown */}
        <div className="flex items-center space-x-4">
          <TeacherProfileDropdown user={loggedInTeacher} />
        </div>
      </nav>
      
      <main className="flex flex-1 overflow-hidden">
        <div className="flex flex-col flex-1 p-6 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default TeacherLayout;
