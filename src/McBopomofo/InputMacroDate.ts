import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import "dayjs/locale/ja";
import "dayjs/locale/zh-tw";

dayjs.extend(localizedFormat);

export default dayjs;
