/* eslint-disable @typescript-eslint/no-explicit-any */
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatPrice } from "@/customFunctions/formatPrice";
import { cn } from "@/lib/utils";

type Props = {
    data: {
        orderID: string,
        customerNames: string,
        customerLastnames: string,
        customerEmail: string,
        customerGender: string,
        orderDate: string,
        totalAmount: number,
    }[]
}

const RecentSales = ({ data }: Props) => {

    return (
        <div>
            {/* <div className="grid gap-y-0.5"> */}
            {data?.slice(0, 5).map((sale) => (
                <div key={sale?.orderID} className="flex items-center justify-center p-1.5 rounded-2xl even:bg-slate-100">

                    <Avatar className='h-10 w-10'>
                        <Avatar>
                            <AvatarImage src={undefined} alt="Foto" />
                            <AvatarFallback className={cn(
                                sale?.customerGender === 'M' ? 'bg-blue-500' : 'bg-pink-500',
                                'text-gray-100 font-bold'
                            )}>
                                <span className='grid grid-cols-1 justify-items-center'>
                                    {/* NAMES  */}
                                    <span className="text-xs">
                                        {sale?.customerNames && sale?.customerNames?.split(" ")?.map((name: string) =>
                                            <span key={name}>{name[0][0]}</span>
                                        )}
                                    </span>

                                    {/* LASTNAMES  */}
                                    <span className="text-xs">
                                        {sale?.customerLastnames && sale?.customerLastnames?.split(" ")?.map((lastname: string) =>
                                            <span key={lastname}>{lastname[0][0]}</span>
                                        )}
                                    </span>
                                </span>
                            </AvatarFallback>
                        </Avatar>
                    </Avatar>

                    <div className="ml-2 space-y-0.5 flex-1">
                        <p className="text-xs text-gray-900 font-medium leading-none">{sale?.customerNames}</p>
                        <p className="text-xs text-gray-900 font-medium leading-none">{sale?.customerLastnames}</p>
                        <p className="text-sm text-muted-foreground">
                            {sale?.customerEmail}
                        </p>
                    </div>

                    <div className="ml-auto text-sm text-pink-800 font-medium">RD$ {formatPrice(sale?.totalAmount)}</div>
                </div>
            ))}
        </div>
        // </div>
    )
}

export default RecentSales