import moment from 'moment';

export class DateValueConverter {
  public toView(dateString: string, format= 'DD/MM/YYYY'): string {
    const m = moment(dateString);
    if (m.isValid) {
      if (format === 'nice') {
        const diff = m.diff(moment(), 'days');
        if (diff < 14) {
          return m.fromNow();
        } else {
          return m.calendar();
        }
      } else if (format === 'calendar') {
        return m.calendar();
      } else if (format === 'fromnow') {
        return m.fromNow(true);
      }  else if (format === 'fromnow+') {
        return m.fromNow(false);
      } else {
        return m.format(format);
      }
    } else {
      return dateString;
    }
  }
}