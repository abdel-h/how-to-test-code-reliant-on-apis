export class Balance {
    constructor(private value: number) {}

    add(value: number) {
        this.value += value;  
    }

    getValue() {
        return this.value; 
    }

}