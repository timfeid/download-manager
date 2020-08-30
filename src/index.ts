import { Download } from "./download";

const download = new Download('https://timfeid.com/test.txt')

download.on('error', error => console.log(error))
download.start().then(r => console.log(r))
