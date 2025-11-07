import { format } from "date-fns";
import DatePicker from "react-datepicker";
import { AiOutlineCalendar, AiOutlineClockCircle } from "react-icons/ai";

interface ExpenseDateTimePickerProps {
  startDate: Date;
  onChange: (date: Date) => void;
}

export default function ExpenseDateTimePicker({ startDate, onChange }: ExpenseDateTimePickerProps) {
  const handleDateChange = (date: Date | null) => {
    if (date) {
      const currentTime = startDate;
      date.setHours(
        currentTime.getHours(),
        currentTime.getMinutes(),
        currentTime.getSeconds()
      );
      onChange(date);
    }
  };

  return (
    <div className="mb-[24px]">
      <label className="block text-[16px] font-medium text-[#052C4D] mb-2">
        Date & Time
      </label>
      <div className="flex h-[56px] justify-between bg-white rounded-2xl p-4 shadow-sm">
        <DatePicker
          selected={startDate}
          onChange={handleDateChange}
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
              <AiOutlineCalendar className="h-[21px] w-[20px] text-[#008DD2]" />
              <span className="text-[16px] font-normal">
                {format(startDate, "MMM d, yyyy")}
              </span>
            </div>
          }
        />

        <div className="flex items-center gap-2 text-[#052C4D]">
          <span className="text-[16px] font-normal">
            {format(startDate, "h:mm aa")}
          </span>
          <AiOutlineClockCircle size={20} className="text-[#008DD2]" />
        </div>
      </div>
    </div>
  );
}