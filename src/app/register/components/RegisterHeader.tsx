import BackButton from "@/components/ui/BackButton";

const RegisterHeader = () => {
  return (
    <>
      <div className="px-[20px] pt-[40px]">
        <BackButton />
      </div>
      <div className="px-[23px] pt-[37px]">
        <h1 className="text-[30px] font-bold text-black mb-[16px]">
          Register
        </h1>
        <p className="text-[16px] text-black mb-[18px]">
          Create an account to access all the features of Linear!
        </p>
      </div>
    </>
  );
};

export default RegisterHeader;