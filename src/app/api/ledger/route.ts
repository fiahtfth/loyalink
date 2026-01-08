import { NextRequest, NextResponse } from "next/server"
import { getCustomerLedger, getMerchantLedger } from "@/lib/ledger-utils"
import { handleApiError, AppError } from "@/lib/errors"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const customerId = searchParams.get("customerId")
    const merchantId = searchParams.get("merchantId")
    const entryType = searchParams.get("entryType") as any
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    if (!customerId && !merchantId) {
      throw new AppError(
        "Either customerId or merchantId must be provided",
        400,
        "MISSING_PARAMETER"
      )
    }

    let result
    if (customerId) {
      result = await getCustomerLedger(customerId, {
        merchantId: merchantId || undefined,
        entryType,
        limit,
        offset,
      })
    } else if (merchantId) {
      result = await getMerchantLedger(merchantId, {
        customerId: customerId || undefined,
        entryType,
        limit,
        offset,
      })
    }

    return NextResponse.json({
      entries: result?.entries || [],
      total: result?.total || 0,
      pagination: {
        limit,
        offset,
        hasMore: (offset + limit) < (result?.total || 0),
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
