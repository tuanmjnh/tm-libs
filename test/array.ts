import { addItems, removeItems, updateItems } from "../src/array";

interface Product {
  id: number
  name: string
}

let products: Product[] = [
  { id: 1, name: 'Iphone' },
  { id: 2, name: 'Samsung' },
]
console.log('original', products)

// ➕ Thêm
addItems(products, { id: 3, name: 'Xiaomi' })
// => [ {id:1,name:'Iphone'}, {id:2,name:'Samsung'}, {id:3,name:'Xiaomi'} ]
console.log('addItems', products)

// 🟡 Cập nhật
updateItems(products, { id: 2, name: 'Samsung Galaxy' }, 'id')
// => [ {id:1,name:'Iphone'}, {id:2,name:'Samsung Galaxy'}, {id:3,name:'Xiaomi'} ]
console.log('updateItems', products)

// ❌ Xóa
removeItems(products, ['Iphone'], 'name')
// => [ {id:2,name:'Samsung Galaxy'}, {id:3,name:'Xiaomi'} ]
console.log('removeItems', products)