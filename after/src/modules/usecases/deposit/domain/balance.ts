import { Result } from "../../../../shared/core/result";
import { ValueObject } from "../../../../shared/domain/valueObject";

type Props = { value: number; };
export class Balance extends ValueObject<Props> {

    getValue() {
        return this.props.value;
    }
    constructor(value: Props) {
        super(value);
    }

    public static create(value: number) {
        return new Balance({ value });
    }
    add(value: number) {
        this.props.value += value;
    }

    withdraw(balance: Balance, value: number) {
        if (balance.getValue() - value < 0) {
            return Result.fail<Balance>('Insufficient funds');
        }
        balance.props.value -= value;
        return Result.ok<Boolean>(true);
    }

}