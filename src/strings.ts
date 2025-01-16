export function normalize(str: string) {
  return str.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
}

export function removeAccents(str: string) {
  var AccentsMap = [
    'aàảãáạăằẳẵắặâầẩẫấậ',
    'AÀẢÃÁẠĂẰẲẴẮẶÂẦẨẪẤẬ',
    'dđ', 'DĐ',
    'eèẻẽéẹêềểễếệ',
    'EÈẺẼÉẸÊỀỂỄẾỆ',
    'iìỉĩíị',
    'IÌỈĨÍỊ',
    'oòỏõóọôồổỗốộơờởỡớợ',
    'OÒỎÕÓỌÔỒỔỖỐỘƠỜỞỠỚỢ',
    'uùủũúụưừửữứự',
    'UÙỦŨÚỤƯỪỬỮỨỰ',
    'yỳỷỹýỵ',
    'YỲỶỸÝỴ'
  ]
  for (var i = 0; i < AccentsMap.length; i++) {
    var re = new RegExp('[' + AccentsMap[i].substr(1) + ']', 'g')
    var char = AccentsMap[i][0]
    str = str.replace(re, char)
  }
  return str
}

export const convertToAscii = (arg: string) => {
  return (
    arg.toLowerCase()
      .replace(/[ ]/g, '_')
      // .replace('[', '')
      // .replace(']', '')
      .replace(/[áàãạảâầấậẫẩăằắẵặẳ]/g, 'a')
      .replace(/[èéẹẽẻêếềễểệ]/g, 'e')
      .replace(/[ìíịỉĩ]/g, 'e')
      .replace(/[òóõọỏôỗộồốổơỡờớợỡở]/g, 'o')
      .replace(/[ùúụũủưừứựữử]/g, 'u')
      .replace(/[ýỳỹỷỵ]/g, 'y')
      .replace(/[đ]/g, 'd')
      .replace(/[~\`!@#$%^&*()--+={}\\|:\'\"<,>.?/”“‘’„‰‾–—]/g, '')
  )
}
export const removeChars = (arg: string) => {
  return arg.replace(/[~`!@#$%^&*()\[{}\]\\|:\'\",<>./?]/g, '')
}

export const toHtml = (arg: string) => {
  if (!arg) return arg
  const el = document.createElement('div')
  el.innerHTML = arg
  return el//el.firstChild.data
}

export const trimChars = (arg: string, char: string) => {
  const regx = new RegExp(char + '$', 'g')
  return arg.replace(regx, '')
}

export const splitBrackets = (val: string, include?: boolean) => {
  try {
    if (include) {
      const rs = val.trim().match(/\[(.*?)\]/g)
      return rs ? rs as Array<string> : [] as Array<string>
    }
    else {
      const rs = val.trim().match(/(?<=\[)[^\]\[\r\n]*(?=\])/g)
      return rs ? rs as Array<string> : [] as Array<string>
    }
  } catch (e) { return [] }
}
