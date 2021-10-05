import {writable} from 'svelte/store';
export default {
    cartCount: writable(0),
    userExist: writable(false),
    user: writable({})
};