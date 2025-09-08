export const HTMLInputElementFile = (opts: any) => {
  const _opts = { ...{ multiple: false, accept: '*', webkitdirectory: false }, ...opts }
  const input = document.createElement('input') as HTMLInputElement
  input.type = 'file'
  input.multiple = _opts.multiple
  input.accept = _opts.accept
  input.webkitdirectory = _opts.webkitdirectory
  // input.onchange = _ => {
  //   if (onChange) onChange(input)
  // }
  return input
}

export const XMLHttpRequestUploadFile = (url: string, file: File, onLoad?: Function) => {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.readAsArrayBuffer(file)
    reader.onload = (e: any) => {
      if (onLoad) onLoad(e)
      // you can keep blob or save blob to another position
      const blob = new Blob([e.target.result], { type: file.type })
      const formData = new FormData()
      // JavaScript file-like object
      formData.append("webmasterfile", blob)
      const request = new XMLHttpRequest()
      request.open("POST", url)
      request.send(formData)
      resolve(true)
    }
  })
}

export const getFileImage = (file: File, isImage: boolean) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    const img = document.createElement('img') as any
    reader.readAsDataURL(file)
    reader.onload = () => {
      img.src = reader.result
      if (isImage) resolve(img)
      else resolve(getBase64Image(img))
    }
  })
}

export const getBase64InputFile = (file: File) => {
  // return new Promise((resolve, reject) => {
  //   const reader = new FileReader()
  //   reader.onloadend = function () {
  //     resolve(reader.result)
  //   }
  //   reader.readAsDataURL(file)
  // })
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = function (e: any) { resolve(e.target.result) }
    reader.onerror = function (e: any) { reject(new Error('Error reading' + file.name + ': ' + e.target.result)) }
    reader.readAsDataURL(file)
  })
}

export const getBase64Image = (img: HTMLImageElement) => {
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height

  const ctx = canvas.getContext('2d') as any
  ctx.drawImage(img, 0, 0)
  const dataURL = img.src
  return dataURL
}
interface FilePathInfo {
  fullPath: string
  fileName: string | null
  fileNameWithoutExt: string | null
  extension: string | null
}

export const parseFilePath = (path: string | null): FilePathInfo | null => {
  try {
    if (!path) return null

    const fileName = path.split(/[/\\]/).pop() || null
    if (!fileName) {
      return {
        fullPath: path,
        fileName: null,
        fileNameWithoutExt: null,
        extension: null
      }
    }

    const match = fileName.match(/^(.*?)(\.[^.]*)?$/)
    const fileNameWithoutExt = match && match[1] ? match[1] : null
    const extension = match && match[2] ? match[2].replace(".", "") : null

    return {
      fullPath: path,
      fileName,
      fileNameWithoutExt,
      extension
    }
  } catch (e) {
    return null
  }
}

export const getFileName = (path: string | null) => {
  try {
    if (!path) return null
    const rs = path.replace(/^.*[\\/]/, '')
    return rs ? rs : null
  } catch (e) { return null }
}
export const getFileNameWithoutExtention = (path: string | null) => {
  try {
    if (!path) return null
    const fileName = path.split(/[/\\]/).pop()
    if (!fileName) return null
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "")
    return nameWithoutExt || null
  } catch (e) { return null }
}
export function getExtension(file: string | null, dot = true, lower = true) {
  if (!file) return null
  const regx = /(?:\.([^.]+))?$/
  file = lower ? file.toLowerCase() : file.toUpperCase()
  const match = regx.exec(file)
  return match ? (dot ? match[0] : match[1]) : ''
}
export function isImage(value: string | null) {
  if (!value) return false
  return /\.(gif|jpg|jpe?g|tiff|png|img|ico|jfif|webp|bmp)$/i.test(value.toLowerCase())
}
export function isAudio(value: string | null) {
  if (!value) return false
  return /\.(mp3|wav|wave|ogg|m4a|3ga|4mp|aa3)$/i.test(value.toLowerCase())
}
export function isVideo(value: string | null) {
  if (!value) return false
  return /\.(3g2|3gp|3gp2|3gpp|3gpp2|amv|flv|gom|mp4|mov|mpe|mpeg|mpg||kmv|mkv|wvm|wmv)$/i.test(value.toLowerCase())
}
export function isPdf(value: string | null) {
  if (!value) return false
  return /\.(pdf)$/i.test(value.toLowerCase())
}
export function isDoc(value: string | null) {
  if (!value) return false
  return /\.(doc|docx)$/i.test(value.toLowerCase())
}
export function isSheet(value: string | null) {
  if (!value) return false
  return /\.(xls|xlsx)$/i.test(value.toLowerCase())
}
export function isFlash(value: string | null) {
  if (!value) return false
  const rs = /\.(swf)$/i.test(value.toLowerCase())
  return rs
}
export function isCode(value: string | null) {
  if (!value) return false
  const rs = /\.(sql|json|js)$/i.test(value.toLowerCase())
  return rs
}
export function isText(value: string | null) {
  if (!value) return false
  const rs = /\.(txt|rtf)$/i.test(value.toLowerCase())
  return rs
}
export function getNameFilePath(fileName: string | null) {
  if (!fileName) return null
  const tmp = fileName.split('/')
  return tmp[tmp.length - 1]
}
export function getBackgroundImage(img: string | null) {
  if (!img) return null
  return `background-size:cover;background-position:50% 50%;background-image:url("${img}")`
}
export function GetImage(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    const img = document.createElement('img') as HTMLImageElement
    reader.onload = () => {
      img.src = String(reader.result)
      resolve(GetBase64Image(img))
    }
    reader.readAsDataURL(file)
  })
}
export function GetBase64Image(img: HTMLImageElement) {
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height

  const ctx = canvas.getContext('2d')
  ctx?.drawImage(img, 0, 0)
  const dataURL = img.src
  return dataURL
}

export function upload(formData: FormData, uploadFieldName: string) {
  const photos = formData.getAll(uploadFieldName)
  const promises = photos//.map(x =>
  // getImage(x).then(img => ({
  //   id: img,
  //   originalName: x.name,
  //   fileName: x.name,
  //   url: img
  // }))
  //)
  return Promise.all(promises)
}

export function fakeTimeOut(val: any) {
  return new Promise((resolve) => {
    // simulating a delay of 2 seconds
    setTimeout(() => {
      resolve(val)
    }, 2000)
  })
}
