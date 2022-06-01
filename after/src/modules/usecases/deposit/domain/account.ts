import { Entity } from '../../../../shared/domain/entity';
import { UniqueEntityID } from '../../../../shared/domain/UniqueEntityID';
import { Balance } from './balance';

type AccountProps = {
    balance: Balance;
    name: string;
}

export class Account extends Entity<AccountProps> {
    private constructor(props: AccountProps, id: UniqueEntityID) {
        super(props, id);
    }

    public static create(id: UniqueEntityID, name: string, balance = 0) {
        return new Account({ name, balance: new Balance(balance) }, id);
    }

    depositBalance(balance: number) {
        this.props.balance.add(balance);
    }

    getBalance() {
        return this.props.balance;
    }

    getAccountId() {
        return this._id.toString();
    }
}