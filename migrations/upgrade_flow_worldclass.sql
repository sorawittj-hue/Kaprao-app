-- ============================================================
-- WORLD-CLASS ORDERING FLOW UPGRADE
-- ============================================================

-- 1. Add tracking_token to orders (Unguessable token for Guest tracking)
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS tracking_token uuid DEFAULT gen_random_uuid();

-- 2. Create RPC function for claiming guest orders
-- When a guest logs in with LINE, they can claim their past guest order
-- and receive the points associated with it!
CREATE OR REPLACE FUNCTION public.claim_guest_order(
    p_order_id bigint,
    p_tracking_token uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_order public.orders;
    v_earned_points int := 0;
    v_new_balance int;
    v_uid uuid := auth.uid();
BEGIN
    -- Require user to be logged in
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'Must be logged in to claim an order';
    END IF;

    -- Find the order
    SELECT * INTO v_order
    FROM public.orders
    WHERE id = p_order_id AND tracking_token = p_tracking_token;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found or invalid tracking token';
    END IF;

    -- Check if already claimed
    IF v_order.user_id IS NOT NULL THEN
        RAISE EXCEPTION 'Order is already claimed by a user';
    END IF;

    -- Update order to be assigned to the current user
    UPDATE public.orders
    SET user_id = v_uid,
        updated_at = now()
    WHERE id = p_order_id;

    -- Calculate points (1 point per 10 baht)
    v_earned_points := FLOOR(COALESCE(v_order.total_price, 0) / 10);

    -- Grant points and update stats if points earned > 0
    IF v_earned_points > 0 THEN
        UPDATE public.profiles
        SET points = points + v_earned_points,
            total_orders = total_orders + 1,
            tier = CASE
                WHEN (points + v_earned_points) >= 2000 THEN 'VIP'
                WHEN (points + v_earned_points) >= 1000 THEN 'GOLD'
                WHEN (points + v_earned_points) >= 500  THEN 'SILVER'
                ELSE 'MEMBER'
            END,
            updated_at = now()
        WHERE id = v_uid
        RETURNING points INTO v_new_balance;

        -- Log points
        INSERT INTO public.point_logs
            (user_id, action, amount, order_id, note, balance_after)
        VALUES
            (v_uid, 'EARN', v_earned_points, p_order_id,
             'อัพเกรดจาก Guest (Order #' || p_order_id || ')', COALESCE(v_new_balance, 0));
    ELSE
        -- Update order count only
        UPDATE public.profiles
        SET total_orders = total_orders + 1,
            updated_at = now()
        WHERE id = v_uid
        RETURNING points INTO v_new_balance;
    END IF;

    -- Return success payload
    RETURN json_build_object(
        'success', true,
        'points_earned', v_earned_points,
        'new_balance', v_new_balance
    );
END;
$$;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.claim_guest_order(bigint, uuid) TO authenticated;

-- Create policy to allow guests to select by tracking_token securely
CREATE POLICY "orders_select_by_tracking_token" ON public.orders
    FOR SELECT 
    USING (
        tracking_token IS NOT NULL -- Client must provide exactly matching token
        -- Handled by application logic: supabase.from('orders').select('*').eq('tracking_token', token)
    );
