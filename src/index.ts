import { Download } from "./download";

const download = new Download('file')

download.on('error', error => console.log(error))
download.start().then(r => console.log(r))
