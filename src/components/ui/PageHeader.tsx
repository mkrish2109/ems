import BackButton from "../ui/BackButton";

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  className?: string;
}

const PageHeader = ({
  title,
  showBackButton = true,
  className,
}: PageHeaderProps) => {
  return (
    <div className="mt-auto sticky top-0 z-40">
      <div className="relative w-full h-[94px] bg-white shadow-[0px_3px_3px_rgba(0,141,210,0.1)] rounded-b-[15px]">
        <div className="absolute bottom-0 w-full flex items-center justify-between px-6 mb-[15px]">
          {showBackButton && (
            <div className="w-[38px] h-[38px] bg-white rounded-full flex items-center justify-center">
              <BackButton />
            </div>
          )}
          <h2
            className={`absolute left-1/2 transform -translate-x-1/2 font-bold text-[#052C4D]
              text-center max-w-[70%] sm:max-w-[80%] md:max-w-[60%]
              text-[clamp(20px,2vw,22px)] ${className ? className : ""}`}
          >
            {title}
          </h2>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
