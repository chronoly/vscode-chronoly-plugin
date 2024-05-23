export var timeString: String | null = null;

export default function statHandler(json: any) {
  const timeInMs = Number(json.totalTime);

  // convert to hours, minutes and seconds
  const hours = Math.floor(timeInMs / 3600000);
  const minutes = Math.floor((timeInMs % 3600000) / 60000);
  const seconds = Math.floor(((timeInMs % 3600000) % 60000) / 1000);

  // make sure they're two digits long
  const hoursString = hours > 0 ? `${hours}h ` : "";
  const minutesString = minutes > 0 ? `${minutes}m` : "0m";
  // const secondsString = seconds < 10 ? `0${seconds}` : seconds;

  if (hours <= 0 && minutes <= 0) {
    timeString = `${seconds}s`;
  } else {
    timeString = `${hoursString}${minutesString}`;
  }
}
