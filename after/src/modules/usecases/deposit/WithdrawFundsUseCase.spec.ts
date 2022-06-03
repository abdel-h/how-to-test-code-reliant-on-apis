import { UniqueEntityID } from '../../../shared/domain/UniqueEntityID';
import { Account } from './domain/account';
import { InMemoryAccountRepository } from './repos/AccountRepository';
import { InMemoryTransactionRepository } from './repos/TransactionRepository';
import { WithdrawFundsUseCase } from './WithdrawFundsUseCase';
import { DateTimeProvider } from "../../../shared/domain/dateTimeProvider";


const RANDOM_DATE_NUMBER = 452202121245;
class CustomDateTimeProvider implements DateTimeProvider {
    private nextDate = 0;

    now(): number {
        return this.nextDate;
    }

    next(date: number) {
        this.nextDate = date;
    }
}

describe('Widthraw funds', () => {
    it('should fail when the account does not exist', async () => {
        const accountRepository = new InMemoryAccountRepository();
        const dateTime = new CustomDateTimeProvider();

        const transactionRepository = new InMemoryTransactionRepository(dateTime);
        const withdrawUseCase = new WithdrawFundsUseCase(accountRepository, transactionRepository);

        const results = await withdrawUseCase.execute({ accountId: 'some_account', amount: 200 });

        expect(results).toEqual({
            type: 'AccountDoesNotExistError',
            message: 'Account does not exist'
        });
    });

    it('should fail when amount is null', async () => {
        const accountRepository = new InMemoryAccountRepository();
        const dateTime = new CustomDateTimeProvider();

        const transactionRepository = new InMemoryTransactionRepository(dateTime);
        const withdrawUseCase = new WithdrawFundsUseCase(accountRepository, transactionRepository);

        const results = await withdrawUseCase.execute({ accountId: 'some_account', amount: null });

        expect(results).toEqual({
            type: 'InvalidAmountError',
            message: 'Can not deposit an invalid amount'
        });
    });
    it('should fail when the amount is bigger than balance', async () => {
        const accountRepository = new InMemoryAccountRepository();
        const newAccount = Account.create(new UniqueEntityID('id_R'), 'withdraw_user_name', 300);
        accountRepository.add([newAccount]);
        const dateTime = new CustomDateTimeProvider();

        const transactionRepository = new InMemoryTransactionRepository(dateTime);
        const withdrawUseCase = new WithdrawFundsUseCase(accountRepository, transactionRepository);

        const result = await withdrawUseCase.execute({ accountId: 'id_R', amount: 500 });

        expect(result).toEqual({
            type: 'InsufficientFundsError',
            message: 'You have no Insufficient Funds'
        });
    });
    it('should withdraw money from account', async () => {
        const accountRepository = new InMemoryAccountRepository();
        const account = Account.create(new UniqueEntityID('id_R'), 'withdraw_user_name', 300);
        accountRepository.add([account]);
        const dateTime = new CustomDateTimeProvider();

        const transactionRepository = new InMemoryTransactionRepository(dateTime);
        const withdrawUseCase = new WithdrawFundsUseCase(accountRepository, transactionRepository);

        await withdrawUseCase.execute({ accountId: 'id_R', amount: 200 });
        const updatedAccount = await accountRepository.fetch('id_R');
        expect(updatedAccount?.getBalance().getValue()).toEqual(100);

    });
    it('should generate a withdraw transaction after the withdraw', async () => {
        const accountRepository = new InMemoryAccountRepository();
        const dateTime = new CustomDateTimeProvider();
        dateTime.next(RANDOM_DATE_NUMBER);

        const account = Account.create(new UniqueEntityID('id_R'), 'withdraw_user_name', 300);
        accountRepository.add([account]);

        const transactionRepository = new InMemoryTransactionRepository(dateTime);

        const withdrawUseCase = new WithdrawFundsUseCase(accountRepository, transactionRepository);

        await withdrawUseCase.execute({ accountId: 'id_R', amount: 200 });


        const result = await transactionRepository.fetch('id_R');
        
        expect(result).toEqual([{
            accountId: 'id_R',
            transactionAmount: 200,
            type: 'withdraw',
            date: RANDOM_DATE_NUMBER
        }]);
    });
});