import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveCartLink, ensureLinkedProduct } from '../lib/cartLink.mjs'
const product = { id: 'bar', weight: '40g', price: 125 }
const resolve = query => resolveCartLink(new URLSearchParams(query), [product, {id:'soon',price:10,comingSoon:true}])
test('valid link uses catalogue price and defaults to one', () => {
  assert.deepEqual(resolve('product=bar&price=1'), {product, quantity:1})
  assert.equal(resolve('product=bar&quantity=3').quantity, 3)
  assert.equal(resolve(''), null)
})
test('reject unknown, upcoming and malformed quantities', () => {
  for (const q of ['product=bad','product=soon', ...['0','-1','1.5','100','Infinity','','2x'].map(q=>'product=bar&quantity='+q)]) assert.ok(resolve(q).error)
})
test('preserve existing cart and avoid duplicate additions', () => {
  const other = {id:'other',variant:{size:'box',price:20},quantity:2}
  const first = ensureLinkedProduct([other],product,3)
  assert.equal(first[0],other)
  assert.equal(first[1].quantity,3)
  assert.deepEqual(ensureLinkedProduct(first,product,3),first)
  assert.equal(ensureLinkedProduct(first,product,1)[1].quantity,3)
  assert.equal(ensureLinkedProduct(first,product,5)[1].quantity,5)
  assert.equal(first[1].quantity,3)
})

