import Footer from "@/components/shared/footer";
import Navbar from "@/components/shared/navbar";

const CommonLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="md:p-5">
      <Navbar />
      <div>{children}</div>
      <Footer />
    </div>
  );
};

export default CommonLayout;
