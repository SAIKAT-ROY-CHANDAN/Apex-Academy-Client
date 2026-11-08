

export type TTitle = {
  subTitle: string;
  title: string;
};

type TTitleProps = {
  titleData: TTitle;
};

export const PageTitle = ({ titleData }: TTitleProps) => {
  return (
    <div className="text-center mb-12 mt-20 max-w-4xl mx-auto px-4 md:px-0">
      <p className="text-sm font-bold tracking-[0.2em] text-[#E6A61E] uppercase mb-3 font-almarai">
        {titleData.subTitle}
      </p>
      <h2 className="text-2xl sm:text-3xl md:text-4xl uppercase tracking-tight text-[#4a2545] leading-tight font-bebas">
        {titleData.title}
      </h2>
    </div>
  );
};
