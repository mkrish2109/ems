import { useState } from "react";
import { HiChevronDown } from "react-icons/hi";

interface ExpensePaymentSelectProps {
  selectedPayment: string;
  onPaymentChange: (method: string) => void;
}

export default function ExpensePaymentSelect({ selectedPayment, onPaymentChange }: ExpensePaymentSelectProps) {
  const [openPayment, setOpenPayment] = useState(false);
  const paymentMethods = ["UPI Pay", "Cash", "Card"];

  return (
    <div className="w-full mb-[75px]">
      <label className="block text-[16px] font-medium text-[#052C4D] mb-2">
        Payment Method
      </label>
      <div className="relative">
        <button
          type="button"
          className="w-full h-14 bg-white rounded-2xl px-4 flex items-center justify-between focus:outline-none cursor-pointer"
          onClick={() => setOpenPayment(!openPayment)}
        >
          <span className="text-[16px] text-[#052C4D]">
            {selectedPayment}
          </span>
          <HiChevronDown
            className="text-[#008DD2] transition-transform"
            size={20}
          />
        </button>
        {openPayment && (
          <div className="absolute right-[15px] w-[160px] -mt-[18px] bg-white rounded-2xl shadow-md z-10">
            {paymentMethods.map((method) => (
              <button
                key={method}
                type="button"
                className="w-full flex items-center justify-between px-4 py-[6px] text-left text-[14px] text-[#052C4D] hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  onPaymentChange(method);
                  setOpenPayment(false);
                }}
              >
                <span>{method}</span>
                <span
                  className={`h-[11px] w-[11px] rounded-full border-2 flex items-center justify-center ${
                    selectedPayment === method
                      ? "border-[#008DD2]"
                      : "border-[#C8C8C8]"
                  }`}
                >
                  {selectedPayment === method && (
                    <span className="w-full h-full bg-[#008DD2] rounded-full"></span>
                  )}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}