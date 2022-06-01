import { Result } from '../../../../shared/core/result';
import { ValueObject } from '../../../../shared/domain/valueObject';

type Props = { value: number }

export class DepositAmount extends ValueObject<Props> {

    getValue() {
        return this.props.value
    }

    constructor(value: Props) {
        super(value)
    }

    public static isValidAmount(amount: number | null): amount is number {
        return amount !== null && amount >= 0; 
    }

    public static create(amount: number |null) {
        if(!DepositAmount.isValidAmount(amount)) {
            return Result.fail<DepositAmount>('Invalid amount')
        }

        return Result.ok<DepositAmount>(new DepositAmount({value: amount}))
    }
}
