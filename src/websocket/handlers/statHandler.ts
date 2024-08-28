export var timeString: String | null = null;

export function parseTime(totalTime: number) {
  const timeInMs = totalTime;

  // convert to hours, minutes and seconds
  const hours = Math.floor(timeInMs / 3600000);
  const minutes = Math.floor((timeInMs % 3600000) / 60000);
  const seconds = Math.floor(((timeInMs % 3600000) % 60000) / 1000);

  // make sure they're two digits long
  const hoursString = hours > 0 ? `${hours}h ` : "";
  const minutesString = minutes > 0 ? `${minutes}m` : "0m";
  // const secondsString = seconds < 10 ? `0${seconds}` : seconds;

  let output = "";

  if (hours <= 0 && minutes <= 0) {
    output = `${seconds}s`;
  } else {
    output = `${hoursString}${minutesString}`;
  }

  return output;
}

export default function statHandler(totalTime: any) {
  timeString = parseTime(
    totalTime.totalTime - Math.max(totalTime.end - Date.now(), 0)
  );
}
