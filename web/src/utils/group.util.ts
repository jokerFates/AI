import dayjs from "dayjs";

const groupSessionsByDate = (time: string) => {
  const today = dayjs();
  const updateTime = dayjs(time);

  let group;
  if (updateTime.isSame(today, "day")) {
    group = "今天";
  } else if (updateTime.isSame(today.subtract(1, "day"), "day")) {
    group = "昨天";
  } else if (updateTime.isAfter(today.subtract(7, "day"))) {
    group = "最近7天";
  } else {
    group = updateTime.format("YYYY年MM月");
  }

  return group;
};

export { groupSessionsByDate };
