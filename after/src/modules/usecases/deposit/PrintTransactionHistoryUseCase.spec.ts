import { UniqueEntityID } from '../../../shared/domain/UniqueEntityID';
import { DepositFundsUseCase } from './DepositFundsUseCase';
import { CustomDateTimeProvider } from './DepositFundsUseCase.spec';
import { Account } from './domain/account';
import { PrintTransactionHistoryUseCase } from './PrintTransactionHistoryUseCase';
import { InMemoryAccountRepository } from './repos/AccountRepository';
import { InMemoryTransactionRepository } from './repos/TransactionRepository';
describe('Print transaction history use case', () => {

    it('should return error when account does not exist', async () => {
        const RANDOM_DATE_NUMBER = 452202121245;

        const dateTime = new CustomDateTimeProvider();
        dateTime.next(RANDOM_DATE_NUMBER);

        const transactionRepository = new InMemoryTransactionRepository(dateTime);
        const accountRepository = new InMemoryAccountRepository();
        const printTransaction = new PrintTransactionHistoryUseCase(accountRepository, transactionRepository);

        const results = await printTransaction.execute({ accountId: 'an_other_id' });

        expect(results).toEqual({
            type: 'AccountDoesNotExistError',
            message: 'Account does not exist'
        });
    });
    it('should return an account', async () => {
        const accountRepository = new InMemoryAccountRepository();
        const dateTime = new CustomDateTimeProvider();

        const RANDOM_DATE_NUMBER = 452202121245;
        dateTime.next(RANDOM_DATE_NUMBER);

        const transactionRepository = new InMemoryTransactionRepository(dateTime);

        const printTransaction = new PrintTransactionHistoryUseCase(accountRepository, transactionRepository);

        const newAccount = Account.create(new UniqueEntityID('id_T'), 'some_user_name', 0);

        accountRepository.add([newAccount]);

        const depositFundsUseCase = new DepositFundsUseCase(accountRepository, transactionRepository);
        await depositFundsUseCase.execute({ accountId: 'id_T', amount: 500 });
        await depositFundsUseCase.execute({ accountId: 'id_T', amount: 200 });

        const expectedResult = [{
            date: RANDOM_DATE_NUMBER, transactionType: 'deposit',
            amount: 500, balance: 700
        }, {
            date: RANDOM_DATE_NUMBER, transactionType: 'deposit',
            amount: 200, balance: 700
        }];

        const results = await printTransaction.execute({ accountId: 'id_T' });
        expect(results).toEqual(expectedResult);
    });
});