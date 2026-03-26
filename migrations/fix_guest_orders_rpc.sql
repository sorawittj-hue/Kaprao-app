CREATE OR REPLACE FUNCTION public.get_orders_by_guest_id(p_guest_id uuid)
RETURNS SETOF public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public.orders
    WHERE guest_id = p_guest_id
    ORDER BY created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_orders_by_guest_id(uuid) TO anon, authenticated;
