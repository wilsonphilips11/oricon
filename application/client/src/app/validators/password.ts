import { FormControl } from '@angular/forms';

export class PasswordValidator {
    static checkConfirmPassword(control: FormControl): any {
        if (control.value === ''){
            return {
                'password is required': true
            };
        }
        if (control.value !== control.root.value['password']){
            return {
                'password does not match': true
            };
        }

        return null;
    }
}
