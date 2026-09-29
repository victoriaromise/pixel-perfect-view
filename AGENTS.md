<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- Payment review and banning go through security-definer DB functions (review_payment, set_account_status) that check has_role admin; why: authorization enforced in the database, not the UI.
- Admin emails are granted the admin role by the new-user trigger; why: spec restricts admin to three fixed emails.
- payment_submissions has provider/provider_reference columns; why: allows Paystack/Flutterwave later without schema rebuild.
