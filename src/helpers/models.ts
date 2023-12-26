export class Plugin {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;

  constructor(
    id: string,
    name: string,
    price: number,
    quantity: number,
    image: string
  ) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.quantity = quantity;
    this.image = image;
  }

  public getTotalPrice(): number {
    return this.price * this.quantity;
  }
}
