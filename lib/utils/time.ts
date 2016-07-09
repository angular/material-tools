export class TimeStamp {

  static now(): string {
    let date = new Date();
    let timeDigits = [date.getHours(), date.getMinutes(), date.getSeconds()]
      .map(value => value < 10 ? '0' + value : value)
      .join(':');

    return `[${timeDigits}]:`;
  }

}
