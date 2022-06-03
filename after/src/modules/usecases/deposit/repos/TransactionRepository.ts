import { DateTimeProvider } from '../../../../shared/domain/dateTimeProvider';

interface ITransactionRequest {
    accountId: string;
    transactionAmount: number;
    type: 'deposit' | 'withdraw';
}

export interface ITransactionResults {
    accountId: string;
    transactionAmount: number;
    type: 'deposit' | 'withdraw';
    date: number;
}

export interface TransactionRepository {
    fetch(accountId: string): Promise<ITransactionResults[] | null>;
    add(transaction: ITransactionRequest): Promise<void>;
}


export class InMemoryTransactionRepository implements TransactionRepository {
    private transactions: ITransactionResults[] = [];

    constructor(private dateTimeProvider: DateTimeProvider) { }

    fetch(accountId: string): Promise<ITransactionResults[] | null> {
        return Promise.resolve(this.transactions.filter((transaction) => transaction.accountId === accountId) ?? null);
    }

    add(transaction: ITransactionRequest): Promise<void> {
        this.transactions.push({ ...transaction, date: this.dateTimeProvider.now() });

        return Promise.resolve();
    }


}