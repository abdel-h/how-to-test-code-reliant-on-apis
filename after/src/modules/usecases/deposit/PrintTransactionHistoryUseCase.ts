import { UseCase } from '../../../shared/core/useCase';
import { AccountRepository } from './repos/AccountRepository';
import { ITransactionResults, TransactionRepository } from './repos/TransactionRepository';
type Input = {
    accountId: string;
};
type AccountDoesNotExist = {
    type: 'AccountDoesNotExistError',
    message: 'Account does not exist';
};
type TransactionHistory = {
    date: number;
    transactionType: 'deposit' | 'withdraw';
    amount: number;
    balance: number;
};
type Results = AccountDoesNotExist | TransactionHistory[] | null | undefined;

export class PrintTransactionHistoryUseCase implements UseCase<Input, Results> {
    constructor(private accountRepository: AccountRepository, private transactionRepository: TransactionRepository) { }
    async execute(input: Input): Promise<Results> {
        const account = await this.accountRepository.fetch(input.accountId);

        if (!account) {
            return {
                type: 'AccountDoesNotExistError',
                message: 'Account does not exist'
            };
        }
        const transactions = await this.transactionRepository.fetch(account.getAccountId());
        return transactions?.map((transactionDetails) => ({
            date: transactionDetails.date,
            transactionType: transactionDetails.type,
            amount: transactionDetails.transactionAmount,
            balance: account.getBalance().getValue()
        }));
    }
}