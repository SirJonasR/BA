import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserHandlingService } from 'src/app/services/user-handling.service';
import { UserSubscriptionService } from 'src/app/services/user-subscription.service';
import { firstValueFrom } from 'rxjs';

export const subscriptionOwnerGuard: CanActivateFn = async (route) => {
  const userHandlingService = inject(UserHandlingService);
  const subscriptionService = inject(UserSubscriptionService);
  const router = inject(Router);

  const subscriptionId = parseInt(route.paramMap.get('id') || '-1');
  const userName = userHandlingService.getUserName();

  try {
    const isOwner = await firstValueFrom(
      subscriptionService.isOwner(userName, subscriptionId),
    );
    if (isOwner) {
      return true;
    }
    router.navigate(['/error']);
    return false;
  } catch (error) {
    router.navigate(['/error']);
    return false;
  }
};
