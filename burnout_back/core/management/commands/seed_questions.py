from django.core.management.base import BaseCommand
from core.models import Question

class Command(BaseCommand):
    help = 'Populeaza baza de date cu intrebarile necesare pentru predictia XGBoost'

    def handle(self, *args, **kwargs):
        questions = [
            {"order": 9, "text": "În ce măsură ești interesat(ă)/pasionat(ă) de domeniul pe care îl studiezi?", "ml_feature_name": "interest_motivation", "is_numeric": False, "is_reverse": False},
            {"order": 10, "text": "Sunt mulțumit(ă) de performanța mea academică din ultima perioadă.", "ml_feature_name": "satisfaction_recognition", "is_numeric": False, "is_reverse": False},
            {"order": 12, "text": "Sunt motivat(ă) să îmi continui studiile în acest domeniu.", "ml_feature_name": "interest_motivation", "is_numeric": False, "is_reverse": False},
            {"order": 13, "text": "Primesc feedback constructiv și util din partea profesorilor.", "ml_feature_name": "satisfaction_recognition", "is_numeric": False, "is_reverse": False},
            {"order": 14, "text": "Simt că efortul meu academic este recunoscut și apreciat.", "ml_feature_name": "satisfaction_recognition", "is_numeric": False, "is_reverse": False},
            {"order": 15, "text": "Câte ore pe zi dedici studiului individual (în medie)?", "ml_feature_name": "study_hours", "is_numeric": True, "is_reverse": False},
            {"order": 16, "text": "Cât de des amâni task-urile academice importante?", "ml_feature_name": "procrastination_score", "is_numeric": False, "is_reverse": False},
            {"order": 17, "text": "Cât de des studiezi în ultima clipă pentru examene?", "ml_feature_name": "procrastination_score", "is_numeric": False, "is_reverse": False},
            {"order": 18, "text": "Am un program de studiu bine organizat și structurat.", "ml_feature_name": "organization_score", "is_numeric": False, "is_reverse": False},
            {"order": 20, "text": "Câte ore dormi în medie pe noapte?", "ml_feature_name": "sleep_hours", "is_numeric": True, "is_reverse": False},
            {"order": 21, "text": "Cât de odihnit(ă) te simți dimineața?", "ml_feature_name": "sleep_quality_score", "is_numeric": False, "is_reverse": False},
            {"order": 22, "text": "Cât de des ai dificultăți în a adormi din cauza gândurilor legate de școală/facultate?", "ml_feature_name": "sleep_difficulty_score", "is_numeric": False, "is_reverse": False},
            {"order": 23, "text": "Calitatea somnului tău în ultimele două săptămâni a fost:", "ml_feature_name": "sleep_quality_score", "is_numeric": False, "is_reverse": False},
            {"order": 24, "text": "Cât de des faci exerciții fizice?", "ml_feature_name": "balanced_lifestyle_score", "is_numeric": False, "is_reverse": False},
            {"order": 25, "text": "Cât de des dedici timp hobby-urilor sau activităților care îți fac plăcere (în afara utilizării telefonului/rețelelor sociale)?", "ml_feature_name": "balanced_lifestyle_score", "is_numeric": False, "is_reverse": False},
            {"order": 26, "text": "Cât de des consumi cafea sau băuturi energizante pentru a te ajuta să studiezi sau să rămâi treaz(ă)?", "ml_feature_name": "stimulant_use", "is_numeric": False, "is_reverse": False},
            {"order": 27, "text": "Câte ore pe zi petreci online în afara studiului (rețele sociale, gaming, divertisment)?", "ml_feature_name": "online_hours", "is_numeric": True, "is_reverse": False},
            {"order": 28, "text": "Te simți copleșit(ă) de volumul de informații digitale/notificări?", "ml_feature_name": "digital_stress_score", "is_numeric": False, "is_reverse": False},
            {"order": 29, "text": "Simți presiunea de a răspunde imediat la mesaje legate de facultate/școală, chiar și în timpul tău liber?", "ml_feature_name": "digital_stress_score", "is_numeric": False, "is_reverse": False},
            {"order": 30, "text": "Folosești dispozitive electronice (telefon, laptop, tabletă) în ultima oră înainte de culcare?", "ml_feature_name": "screens_before_sleep_score", "is_numeric": False, "is_reverse": False},
            {"order": 31, "text": "În ultima săptămână m-am simțit foarte nervos/nervoasă sau încordat(ă).", "ml_feature_name": "stress_negative_affect", "is_numeric": False, "is_reverse": False},
            {"order": 32, "text": "Când trăiesc emoții negative intense, îmi este greu să îmi controlez comportamentul sau să mă concentrez.", "ml_feature_name": "stress_negative_affect", "is_numeric": False, "is_reverse": False},
            {"order": 33, "text": "Simt o presiune mare (din partea părinților/profesorilor) să am rezultate bune.", "ml_feature_name": "pressure_perfectionism", "is_numeric": False, "is_reverse": False},
            {"order": 34, "text": "În ce măsură îți stabilești standarde foarte înalte pentru tine însuți/însăți?", "ml_feature_name": "pressure_perfectionism", "is_numeric": False, "is_reverse": False},
            {"order": 35, "text": "Mă simt eșuat(ă) chiar și când performanța mea este bună.", "ml_feature_name": "pressure_perfectionism", "is_numeric": False, "is_reverse": False},
            {"order": 36, "text": "Am persoane (familie/prieteni) pe care mă pot baza când am probleme.", "ml_feature_name": "social_support_score", "is_numeric": False, "is_reverse": False},
            {"order": 37, "text": "Cât de des socializezi cu colegii în afara activităților academice?", "ml_feature_name": "social_support_score", "is_numeric": False, "is_reverse": False},
            {"order": 38, "text": "Te simți izolat(ă) sau singur(ă)?", "ml_feature_name": "isolation_score", "is_numeric": False, "is_reverse": False},
            {"order": 39, "text": "Când întâmpin o problemă dificilă la școală/facultate, am tendința să mă critic pe mine însumi/însămi sau să renunț.", "ml_feature_name": "self_criticism_score", "is_numeric": False, "is_reverse": False},
            {"order": 40, "text": "Îmi revin repede după ce trec printr-o perioadă dificilă sau stresantă.", "ml_feature_name": "low_resilience_score", "is_numeric": False, "is_reverse": True},
            {"order": 41, "text": "În ultima săptămână, m-am simțit trist(ă), deprimat(ă) sau fără speranță.", "ml_feature_name": "stress_negative_affect", "is_numeric": False, "is_reverse": False},
        ]

        # update_or_create asigură că, dacă rulezi comanda de 2 ori, nu dublează întrebările
        for q in questions:
            Question.objects.update_or_create(
                order=q['order'],
                defaults={
                    'text': q['text'],
                    'ml_feature_name': q['ml_feature_name'],
                    'is_numeric': q['is_numeric'],
                    'is_reverse': q['is_reverse']
                }
            )
        
        self.stdout.write(self.style.SUCCESS(f'Succes! Am încărcat {len(questions)} întrebări în baza de date.'))