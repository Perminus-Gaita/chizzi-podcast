import mongoose from 'mongoose';
import SponsorshipModel from '@/models/payments/sponsorship.model';
import { TournamentModel } from "@/models/tournament.model";
import CustomError from '@/api-lib/error-handling/custom-error';

export async function handleDirectSponsorship(
    sessionUser, tournamentId, amount, currency, transactionCode
) {
    // create mongodb database transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try{

        // Create sponsorship doc set status to processing
        const sponsorshipDoc = await createSponsorshipDocument(
            sessionUser._id,
            tournamentId,
            amount,
            currency,
            transactionCode,
            session
        )

        // update tournament document
        const updatedTournamentDoc = await updateTournamentDocument(
            tournamentId,
            sponsorshipDoc._id,
            sessionUser._id,
            amount,
            currency,
            session
        )

        await session.commitTransaction();

        return {
            sponsorship: sponsorshipDoc,
            tournament: updatedTournamentDoc
        }
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }

}


async function createSponsorshipDocument(
    sponsorId,
    tournamentId,
    amount, // tournamentAmount
    currency,
    mpesaTransactionCode,
    session
) {
    try {
        const newSponsorshipDocument = new SponsorshipModel({
            sponsorId: sponsorId,
            tournamentId: tournamentId,
            type: "direct",
            status: "processing",
            amount: amount,
            currency,
            paymentMethod: "userManagedMpesa",
            mpesaTransactionCode: mpesaTransactionCode
        });
      
        const sponsorshipDoc = await newSponsorshipDocument.save({ session });

        return sponsorshipDoc;
    } catch (error) {
        throw new Error(`Error creating sponsorship doc: ${error.message}`);
    }
}

async function updateTournamentDocument(
    tournamentId,
    sponsorshipId,
    sponsorId,
    amount,
    currency,
    session
) {
    try {
        const updatedTournament = await TournamentModel.findByIdAndUpdate(
            tournamentId,
            {
            //   $inc: { 
            //     "sponsorshipDetails.currentAmount": Number(update.amount) 
            //   },
                $push: {
                    "sponsorshipDetails.sponsors": {
                        sponsorshipId: sponsorshipId,
                        user: sponsorId,
                        amount: Number(amount),
                        currency: currency,
                        sponsoredAt: new Date(),
                    }
                },
            },
            { 
                new: true, 
                runValidators: true, 
                session
            }
        );

        if (!updatedTournament) {
            throw new Error('Tournament document not found');
        }

        return updatedTournament;
    } catch (error) {
        throw new Error(`Error updating tournament: ${error.message}`);
    }
}

