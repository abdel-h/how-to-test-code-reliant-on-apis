import { UniqueEntityID } from '../../../../shared/domain/UniqueEntityID';
import { Account } from '../domain/account';

export interface AccountRepository {
    fetch(accountId: string): Promise<Account | null>;
    update(accountId: string, account: Account): Promise<null>;
}


class AccountCollection {
    private accounts: Account[] = [];

    constructor() { }

    add(account: Account) {
        const clonedAccount = Account.create(new UniqueEntityID(account.getAccountId()),
            account.props.name, account.props.balance.getValue());
        this.accounts.push(clonedAccount);
    }

    update(accountId: string, account: Account) {
        const foundAccountIndex = this.findAccountIndex(accountId);
        this.accounts[foundAccountIndex] = account;
    }

    addMany(account: Account[]) {
        account.forEach((account) => {
            this.add(account);
        });
    }

    findById(accountId: string) {
        const account = this.accounts.find((account) => account.getAccountId() === accountId);

        return account;
    }

    findAccountIndex(accountId: string) {
        return this.accounts.findIndex((account) => account.getAccountId() === accountId);
    }

    getAll() {
        return this.accounts;
    }
}

export class InMemoryAccountRepository implements AccountRepository {

    private accounts = new AccountCollection();

    fetch(accountId: string): Promise<Account | null> {
        const account = this.accounts.findById(accountId);

        return Promise.resolve(account ?? null);
    }

    update(accountId: string, account: Account): Promise<null> {
        this.accounts.update(accountId, account);

        return Promise.resolve(null);
    }

    add(accounts: Account[]) {
        this.accounts.addMany(accounts)
    }

    getAccount() {
        return this.accounts;
    }
}