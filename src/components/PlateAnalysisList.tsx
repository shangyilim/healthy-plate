import { collection, getFirestore, limit, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useFirebaseUser } from "../hooks";
import PlateAnalysisItem from "./PlateAnalysisItem";
import { AnalysisResult } from "../types";


const db = getFirestore();
export const PlateAnalysisList = () => {

    const user = useFirebaseUser();
    const [plateAnalysisList, setPlateAnalysisList] = useState<AnalysisResult[]>([]);

    useEffect(() => {
        if(!user){
            return;
        }
        const q = query(
            collection(db, "analysis"),
            where("uid", "==", user.uid),
            orderBy("timestamp", "desc"),
            limit(10)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const plateAnalysisList = snapshot.docs.map((doc) => ({
                docId: doc.id,
                ...doc.data(),
            } as AnalysisResult))
                
            setPlateAnalysisList(plateAnalysisList);
        });

        return () => unsubscribe();
    }, [user]);

    return <div>
        {plateAnalysisList.map((plateAnalysis) => <PlateAnalysisItem key={plateAnalysis.docId} analysis={plateAnalysis} />)}
    </div>

       
};
