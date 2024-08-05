
export function formatPrice(price: number | undefined) {
    const priceformatted = (price)?.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    return priceformatted
}