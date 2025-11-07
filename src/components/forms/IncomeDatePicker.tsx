import { format } from "date-fns";
import DatePicker from "react-datepicker";
import { AiOutlineCalendar } from "react-icons/ai";

interface IncomeDatePickerProps {
  startDate: Date;
  error: string;
  onChange: (date: Date) => void;
}

export default function IncomeDatePicker({ startDate, error, onChange }: IncomeDatePickerProps) {
  return (
    <div>
      <label className="block text-[16px] font-medium text-[#052C4D] mb-2">
        Date & Time *
      </label>
      <div className={`flex h-[56px] justify-between bg-white rounded-2xl p-4 shadow-sm ${
        error ? "border border-red-400" : ""
      }`}>
        <DatePicker
          selected={startDate}
          onChange={(date) => date && onChange(date)}
          dateFormat="MMM d, yyyy"
          popperClassName="!z-[100]"
          popperPlacement="bottom-start"
          popperModifiers={[
            {
              name: "preventOverflow",
              options: {
                boundary: "viewport",
              },
              fn: (state) => state,
            },
          ]}
          customInput={
            <div className="flex items-center gap-2 text-[#052C4D] cursor-pointer">
              <AiOutlineCalendar className="h-6 w-6 text-[#008DD2]" />
              <span className="text-lg font-normal">
                {format(startDate, "MMM d, yyyy")}
              </span>
            </div>
          }
        />
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-1 ml-2">{error}</p>
      )}
    </div>
  );
}