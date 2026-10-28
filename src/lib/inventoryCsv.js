export function parseInventoryCsv(content) {
  const lines = content.trim().split(/\r?\n/)
  if (lines.length < 2) throw new Error('The CSV must include a header row and at least one product.')

  const parseLine = (line) => {
    const values = []
    let value = ''
    let quoted = false
    for (let index = 0; index < line.length; index += 1) {
      const character = line[index]
      if (character === '"' && line[index + 1] === '"' && quoted) {
        value += '"'
        index += 1
      } else if (character === '"') {
        quoted = !quoted
      } else if (character === ',' && !quoted) {
        values.push(value.trim())
        value = ''
      } else {
        value += character
      }
    }
    if (quoted) throw new Error('The CSV contains an unclosed quoted field.')
    values.push(value.trim())
    return values
  }

  const headers = parseLine(lines[0]).map((header) =>
    header.replace(/^\uFEFF/, '').toLowerCase().replace(/[^a-z0-9]/g, ''),
  )
  const findIndex = (...names) => headers.findIndex((header) => names.includes(header))
  const nameIndex = findIndex('name', 'product', 'item', 'itemname')
  const skuIndex = findIndex('sku', 'skucode')
  const quantityIndex = findIndex('quantity', 'qty', 'onhand', 'stock')
  if (nameIndex < 0 || skuIndex < 0 || quantityIndex < 0) {
    throw new Error('CSV needs Name, SKU, and Quantity (or On Hand) columns.')
  }

  const categoryIndex = findIndex('category')
  const thresholdIndex = findIndex('threshold', 'minimum', 'minquantity')
  const locationIndex = findIndex('location', 'warehouse')
  const binIndex = findIndex('bin', 'binlocation')
  const costIndex = findIndex('cost', 'unitcost')
  const priceIndex = findIndex('price', 'retail', 'sellingprice')
  const rows = lines.slice(1).filter((line) => line.trim()).map((line, lineIndex) => {
    const values = parseLine(line)
    const name = values[nameIndex]?.trim()
    const sku = values[skuIndex]?.trim()
    const quantity = Number(values[quantityIndex])
    const threshold = thresholdIndex < 0 ? 1 : Number(values[thresholdIndex] || 1)
    if (!name || !sku || !Number.isInteger(quantity) || quantity < 0 || !Number.isInteger(threshold) || threshold < 1) {
      throw new Error(`CSV row ${lineIndex + 2} has an invalid name, SKU, quantity, or threshold.`)
    }
    return {
      name,
      sku,
      quantity,
      threshold,
      category: values[categoryIndex] || 'Uncategorized',
      location: values[locationIndex] || 'Main Warehouse',
      bin: values[binIndex] || '',
      cost: Number(values[costIndex]) || 0,
      price: Number(values[priceIndex]) || 0,
      unit: 'units',
    }
  })

  if (!rows.length) throw new Error('The CSV has no product rows to import.')
  return rows
}
