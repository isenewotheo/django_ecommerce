import Store from './store.js';


function addItemToCart(newProduct) {
    // This function get the cartProducts from the localStorage 
    // converts it back to an object
    // then it checks if the product already exit in the list else it add it
    let stringedCartProducts = window.localStorage.getItem("cartProducts");
    let cartProducts = JSON.parse(stringedCartProducts);
    function add() {
        let arr = [newProduct, ...cartProducts.products];
        arr = {products: arr}
        let stringedArr = JSON.stringify(arr);
        window.localStorage.setItem("cartProducts", stringedArr)
        Store.cartCount.update(preValue => {
            return arr.products.length;
        })
    }

    try {
        if (cartProducts.products.length == 0) {
            add();
        } else {
            
            let productExist = false;
            
            cartProducts.products.forEach(product => {
                if (product.id == newProduct.id) {
                    productExist = true;
                } 
            });

            if (productExist){
                console.log("already there ")
            }else{
                add();
            }
        }
    } catch (error) {
        console.log(error)
    }
}


function removeItemFromCart(productID) {
	let stringedCartProducts = window.localStorage.getItem("cartProducts");
    let cartProducts = JSON.parse(stringedCartProducts);
    
    let newArr = cartProducts.products.filter(prod => prod.id != productID)

    let newCartProducts = {products: newArr}

    let stringedArr = JSON.stringify(newCartProducts);
    window.localStorage.setItem("cartProducts", stringedArr)
    Store.cartCount.update(preValue => {
        return newCartProducts.products.length;
    })
}


export {addItemToCart, removeItemFromCart}