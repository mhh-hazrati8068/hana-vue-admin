
export const moneyMixin = {
  methods: {
    toCurrency(value, symbol = '', forceSymbol = false) {
      if (typeof value !== "number") {
        return value + ' ' + (forceSymbol ? symbol : '');
      }
      return value.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") + ' ' + (forceSymbol ? symbol : '');
    }
  }
}
