import { format } from "date-fns";
import DatePicker from "react-datepicker";
import { AiOutlineCalendar } from "react-icons/ai";

interface CustomDatePickerProps {
  selected: Date;
  onChange: (date: Date) => void;
  error?: string;
}

export default function CustomDatePicker({ selected, onChange, error }: CustomDatePickerProps) {
  return (
    <div>
      <div className={`flex h-[56px] justify-between bg-white rounded-2xl p-4 shadow-sm ${
        error ? 'border-2 border-red-500' : ''
      }`}>
        <DatePicker
          selected={selected}
          onChange={(date) => date && onChange(date)}
          dateFormat="MMM d, yyyy"
          popperClassName="!z-[100]"
          popperPlacement="bottom-start"
          customInput={
            <div className="flex items-center gap-2 text-[#052C4D] cursor-pointer">
              <AiOutlineCalendar className="h-6 w-6 text-[#008DD2]" />
              <span className="text-lg font-normal">
                {format(selected, "MMM d, yyyy")}
              </span>
            </div>
          }
        />
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}