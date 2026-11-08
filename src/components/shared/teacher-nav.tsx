import Image from "next/image";
import logo from "@/assets/institution/logo.svg";
import profile from "@/assets/Profile.png";

const TeacherNav = () => {
  return (
    <div className="flex items-center justify-between rounded-2xl border py-5">
      <div>
        <Image
          src={logo}
          alt="Apex International College"
          width={44}
          height={44}
          className="h-12 w-12 lg:h-11 lg:w-11"
        />
      </div>
      <div>
        <Image
          src={profile}
          alt="Apex International College"
          width={44}
          height={44}
          className="h-9 w-9 lg:h-11 lg:w-11"
        />
      </div>
    </div>
  );
};

export default TeacherNav;
